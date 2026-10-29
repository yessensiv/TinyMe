import { notFound } from "next/navigation";
import { friends } from "@/data/mock";
import { FriendView } from "@/features/friends/friend-view";
export default async function FriendPage({ params }: { params: Promise<{ id: string }> }) {
 const { id }=await params;const friend=friends.find(f=>f.id===id);if(!friend)notFound();
 return <FriendView friend={friend}/>;
}
