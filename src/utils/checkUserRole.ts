import { UserRole } from "~/server/api/types";

export const checkUserRole = async (id:number):Promise<UserRole> => {
    const idString = id.toString();
    const response = await fetch('http://hytkybot:3000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user: idString })
    });
  
    const json = await response.json();
    const role = json.role as UserRole; // Type assertion

    if (role !== "admin" && role !== "active" && role !== "nakki") {
        throw new Error(`Invalid user role: ${role}`);
    }

    return role;
  }