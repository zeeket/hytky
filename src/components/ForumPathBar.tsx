import Link from "next/link";

export const ForumPathBar = (props:ForumPathBarProps) => {
    return (
        <div className="flex flex-row gap-2">
        { props.path.slice(1,props.path.length).map((p, i) => {
            return (
                <div key={i}>
                    <span className="text-white">/</span>
                    <Link href={`/forum/${props.path.slice(0, i+1).join('/')}`}>
                        <span className="text-white">{i===0?"HYTKY Foorumi":p}</span>
                    </Link>
                </div>
            );
        })
        }
        </div>
    );
};

export type ForumPathBarProps = {
    path: string[];
};