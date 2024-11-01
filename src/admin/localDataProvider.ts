/* eslint-disable eqeqeq */
import fakeRestProvider from 'ra-data-fakerest'
import { CreateParams, DataProvider, GetListParams, GetOneParams, GetManyParams, QueryFunctionContext, GetManyReferenceParams, Identifier, DeleteParams, RaRecord, UpdateParams } from 'ra-core'
import pullAt from 'lodash/pullAt'

/**
 * Respond to react-admin data queries using a local database persisted in localStorage
 *
 * Useful for local-first web apps. The storage is shared between tabs.
 *
 * @example // initialize with no data
 *
 * import localStorageDataProvider from 'ra-data-local-storage'
 * const dataProvider = localStorageDataProvider()
 *
 * @example // initialize with default data (will be ignored if data has been modified by user)
 *
 * import localStorageDataProvider from 'ra-data-local-storage'
 * const dataProvider = localStorageDataProvider({
 *   defaultData: {
 *     posts: [
 *       { id: 0, title: 'Hello, world!' },
 *       { id: 1, title: 'FooBar' },
 *     ],
 *     comments: [
 *       { id: 0, post_id: 0, author: 'John Doe', body: 'Sensational!' },
 *       { id: 1, post_id: 0, author: 'Jane Doe', body: 'I agree' },
 *     ],
 *   }
 * })
 */
export default (params?: LocalStorageDataProviderParams): DataProvider => {
    const {
        defaultData = {},
        localStorageKey = 'ra-data-local-storage',
        loggingEnabled = false,
        localStorageUpdateDelay = 10, // milliseconds
    } = params || {}
    const localStorageData = localStorage.getItem(localStorageKey)
    let data = localStorageData ? JSON.parse(localStorageData) : defaultData

    // change data by executing callback, then persist in localStorage
    const updateLocalStorage = (callback: { (): void; (): void; (): void; (): void; (): void; (): void; }) => {
        // modify localStorage after the next tick
        setTimeout(() => {
            callback()
            localStorage.setItem(localStorageKey, JSON.stringify(data))
        }, localStorageUpdateDelay)
    }

    let baseDataProvider = fakeRestProvider(
        data,
        loggingEnabled
    ) as DataProvider

    window?.addEventListener('storage', event => {
        if (event.key === localStorageKey) {
            const newData = event.newValue ? JSON.parse(event.newValue) : {}
            data = newData
            baseDataProvider = fakeRestProvider(
                newData,
                loggingEnabled
            ) as DataProvider
        }
    })

    return {
        // read methods are just proxies to FakeRest
        getList: <RecordType extends RaRecord = unknown>(resource: string, params: GetListParams & QueryFunctionContext) =>
            baseDataProvider
                .getList<RecordType>(resource, params)
                .catch(error => {
                    if (error.code === 1) {
                        // undefined collection error: hide the error and return an empty list instead
                        return { data: [], total: 0 }
                    } else {
                        throw error
                    }
                }),
        getOne: <RecordType extends RaRecord = any>(resource: string, params: GetOneParams<RecordType> & QueryFunctionContext) =>
            baseDataProvider.getOne<RecordType>(resource, params),
        getMany: <RecordType extends RaRecord = any>(resource: string, params: GetManyParams<RecordType> & QueryFunctionContext) =>
            baseDataProvider.getMany<RecordType>(resource, params),
        getManyReference: <RecordType extends RaRecord = any>(
            resource: string,
            params: GetManyReferenceParams & QueryFunctionContext
        ) =>
            baseDataProvider
                .getManyReference<RecordType>(resource, params)
                .catch(error => {
                    if (error.code === 1) {
                        // undefined collection error: hide the error and return an empty list instead
                        return { data: [], total: 0 }
                    } else {
                        throw error
                    }
                }),

        // update methods need to persist changes in localStorage
        update: <RecordType extends RaRecord = any>(resource: string, params: UpdateParams<any>) => {
            updateLocalStorage(() => {
                const index = data[resource]?.findIndex(
                    (                    record: { id: any; }) => record.id == params.id
                )
                data[resource][index] = {
                    ...data[resource][index],
                    ...params.data,
                }
            })
            return baseDataProvider.update<RecordType>(resource, params)
        },
        updateMany: (resource, params) => {
            updateLocalStorage(() => {
                params.ids.forEach(id => {
                    const index = data[resource]?.findIndex(
                        (                        record: { id: Identifier; }) => record.id == id
                    )
                    data[resource][index] = {
                        ...data[resource][index],
                        ...params.data,
                    }
                })
            })
            return baseDataProvider.updateMany(resource, params)
        },
        create: <RecordType extends Omit<RaRecord, 'id'> = any>(
            resource: string,
            params: CreateParams<any>
        ) => {
            // we need to call the fakerest provider first to get the generated id
            return baseDataProvider
                .create<RecordType>(resource, params)
                .then(response => {
                    updateLocalStorage(() => {
                        if (!data.hasOwnProperty(resource)) {
                            data[resource] = []
                        }
                        data[resource].push(response.data)
                    })
                    return response
                })
        },
        delete: <RecordType extends RaRecord = any>(resource: string, params: DeleteParams<RecordType>) => {
            updateLocalStorage(() => {
                const index = data[resource]?.findIndex(
                    (                    record: { id: any; }) => record.id == params.id
                )
                pullAt(data[resource], [index])
            })
            return baseDataProvider.delete<RecordType>(resource, params)
        },
        deleteMany: (resource, params) => {
            updateLocalStorage(() => {
                const indexes = params.ids.map(id =>
                    data[resource]?.findIndex((record) => record.id == id)
                )
                pullAt(data[resource], indexes)
            })
            return baseDataProvider.deleteMany(resource, params)
        },
    }
}

export interface LocalStorageDataProviderParams {
    defaultData?: any
    localStorageKey?: string
    loggingEnabled?: boolean
    localStorageUpdateDelay?: number
}