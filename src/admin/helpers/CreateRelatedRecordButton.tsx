import { Button, Link, useRecordContext } from 'react-admin';

interface CreateRelatedRecordButtonProps {
    resource: string;
    source: string;
    target: string;
}

export const CreateRelatedRecordButton: React.FC<CreateRelatedRecordButtonProps>  = ({resource, source, target}: CreateRelatedRecordButtonProps) => {
    const record = useRecordContext();
    if (!record)  return null;
    const sourceStr = JSON.stringify({[target]: record[source]});
    if (!record) return null;
    return (
        <Button>
          <Link to={`/${resource}/create?source=${sourceStr}`}>Create</Link>
        </Button>
    );
};