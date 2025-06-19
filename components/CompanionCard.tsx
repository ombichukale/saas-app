"use client";
import { removeBookmark, addBookmark } from "@/lib/actions/companion.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface CompanionCardProps {
    id: string;
    name: string;
    topic: string;
    subject: string;
    duration: number;
    color: string;
    bookmarked: boolean;
    onUnbookmark?: (id: string) => void; // 👈 optional callback to remove from list
}

const CompanionCard = ({
                           id,
                           name,
                           topic,
                           subject,
                           duration,
                           color,
                           bookmarked,
                           onUnbookmark,
                       }: CompanionCardProps) => {
    const pathname = usePathname();
    const [isBookmarked, setIsBookmarked] = useState(bookmarked);

    const handleBookmark = async () => {
        if (isBookmarked) {
            await removeBookmark(id, pathname);
            setIsBookmarked(false);
            onUnbookmark?.(id); // 👈 notify parent to remove this card
        } else {
            await addBookmark(id, pathname);
            setIsBookmarked(true);
        }
    };

    return (
        <article className="companion-card" style={{ backgroundColor: color }}>
            <div className="flex justify-between items-center">
                <div className="subject-badge">{subject}</div>
                <button
                    className={`companion-bookmark transition duration-200 ${
                        isBookmarked ? "text-black" : "text-muted"
                    }`}
                    onClick={handleBookmark}
                >
                    <Image
                        src={isBookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
                        alt="bookmark"
                        width={12.5}
                        height={15}
                    />
                </button>
            </div>

            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-sm">{topic}</p>

            <div className="flex items-center gap-2">
                <Image src="/icons/clock.svg" alt="duration" width={13.5} height={13.5} />
                <p className="text-sm">{duration} minutes</p>
            </div>

            <Link href={`/companions/${id}`} className="w-full">
                <button className="btn-primary w-full justify-center">Launch Lesson</button>
            </Link>
        </article>
    );
};

export default CompanionCard;
