import { UserCircleIcon } from "@heroicons/react/24/outline"
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export const AccountDropdown = ( ) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { data: session } = useSession();
    return (
        <div className="inline-block text-left absolute top-8 right-8">
            <UserCircleIcon className="h-16 w-16 text-oldschool-orange" onClick={(e)=>{
                e.preventDefault();
                setShowDropdown(!showDropdown);
                }}/>
            {showDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="flex flex-col">
                    <p className="text-center text-gray-400">Kirjautunut {session?.user.name} ({session?.user.role})</p>
                    <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700"></hr>
                    <button onClick={() => { signOut().catch((err)=>console.log(err)) } }>Kirjaudu ulos</button>
                    </div>
                </div>
            )}
        </div>
    )
}