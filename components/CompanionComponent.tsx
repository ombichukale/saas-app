"use client";

import { useEffect, useRef, useState } from "react";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import { addToSessionHistory } from "@/lib/actions/companion.actions";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

const CompanionComponent = ({
                                companionId,
                                subject,
                                topic,
                                name,
                                userName,
                                userImage,
                                style,
                                voice,
                            }: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    const lottieRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        if (lottieRef && isSpeaking) lottieRef.current?.play();
        else lottieRef.current?.stop();
    }, [isSpeaking]);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
            addToSessionHistory(companionId);
        };
        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [newMessage, ...prev]);
            }
        };
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => console.log("Error", error);

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);

    const toggleMicrophone = () => {
        const isMutedNow = vapi.isMuted();
        vapi.setMuted(!isMutedNow);
        setIsMuted(!isMutedNow);
    };

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        const assistantOverrides = {
            variableValues: { subject, topic, style },
            clientMessages: ["transcript"],
            serverMessages: [],
        };
        // @ts-expect-error
        vapi.start(configureAssistant(voice, style), assistantOverrides);
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    return (
        <section className="flex flex-col h-screen max-h-screen p-4 overflow-hidden bg-gray-50">
            {/* TOP SECTION */}
            <section className="flex gap-6 max-md:flex-col">
                {/* COMPANION */}
                <div className="flex-1 items-center justify-center flex flex-col gap-2">
                    <div
                        className="w-36 h-36 relative rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getSubjectColor(subject) }}
                    >
                        <Image
                            src={`/icons/${subject}.svg`}
                            alt={subject}
                            width={100}
                            height={100}
                            className={cn(
                                "transition-opacity absolute",
                                callStatus === CallStatus.ACTIVE ? "opacity-0" : "opacity-100"
                            )}
                        />
                        {callStatus === CallStatus.ACTIVE && (
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                className="w-24 h-24"
                            />
                        )}
                    </div>
                    <p className="font-bold text-lg mt-2">{name}</p>
                </div>

                {/* USER + CONTROLS */}
                <div className="flex-1 flex flex-col items-center gap-4">
                    <Image src={userImage} alt={userName} width={90} height={90} className="rounded-lg" />
                    <p className="font-bold text-lg">{userName}</p>

                    <button
                        className="btn-mic"
                        onClick={toggleMicrophone}
                        disabled={callStatus !== CallStatus.ACTIVE}
                    >
                        <Image
                            src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
                            alt="mic"
                            width={24}
                            height={24}
                        />
                        <p className="text-sm">{isMuted ? "Unmute" : "Mute"}</p>
                    </button>

                    <button
                        className={cn(
                            "rounded-lg py-2 px-6 w-full text-white text-sm",
                            callStatus === CallStatus.ACTIVE ? "bg-red-600" : "bg-blue-600",
                            callStatus === CallStatus.CONNECTING && "animate-pulse"
                        )}
                        onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
                    >
                        {callStatus === CallStatus.ACTIVE
                            ? "End Session"
                            : callStatus === CallStatus.CONNECTING
                                ? "Connecting..."
                                : "Start Session"}
                    </button>
                </div>
            </section>

            {/* TRANSCRIPT SECTION */}
            <section className="mt-6 flex-1 overflow-y-auto bg-white rounded-xl p-4 space-y-3 text-black">
                {messages.map((message, index) => {
                    const speaker =
                        message.role === "assistant"
                            ? name.split(" ")[0].replace(/[.,]/g, "")
                            : userName;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "rounded-lg px-3 py-2 text-sm break-words max-w-[90%]",
                                message.role === "assistant" ? "bg-gray-100 self-start" : "bg-blue-100 self-end"
                            )}
                        >
                            <strong>{speaker}:</strong> {message.content}
                        </div>
                    );
                })}
            </section>
        </section>
    );
};

export default CompanionComponent;
