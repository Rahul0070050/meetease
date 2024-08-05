// @ts-nocheck
"use client";
import { useGetCalls } from "@/hook/useGetCalls";
import {
  Call,
  CallRecording,
  CallRecordingList,
} from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import MeetingCard from "./MeetingCard";
import Loader from "./Loader";
import { useToast } from "./ui/use-toast";

function CallList({ type }: { type: "ended" | "upcoming" | "recordings" }) {
  const { endedCalls, upcomingCalls, callRecording, loading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const toast = useToast();
  const router = useRouter();
  function getCalls() {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  }

  function getNoCallsMessage() {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "recordings":
        return "No Recordings";
      case "upcoming":
        return "No Upcoming Calls";
      default:
        return [];
    }
  }

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const callData = await Promise.all(
          callRecording?.map((meeting) => meeting.queryRecordings()) ?? []
        );

        const recordings = callData
          .filter((call) => call.recordings.length > 0)
          .flatMap((call) => call.recordings);

        setRecordings(recordings);
      } catch (error) {
        toast({
          title: "Error fetching recordings",
        });
      }
    };

    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, callRecording]);

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  if (loading) return <Loader />;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call)?.id}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            title={
              (meeting as Call)?.state?.custom?.description?.substring(0, 20) ||
              (meeting as Call)?.filename?.substring(0, 20) ||
              "Personal Meeting"
            }
            date={
              (meeting as Call)?.state?.startsAt?.toLocaleString() ||
              meeting?.start_time?.toLocaleString()
            }
            isPreviousMeeting={type === "ended"}
            buttonIcon1={type === "recordings" ? "/icons/play.svg" : undefined}
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () => router.push(`${meeting?.url}`)
                : () => router.push(`/meeting/${meeting.id}`)
            }
            link={
              type === "recordings"
                ? (meeting as Call).url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meeting?.id}`
            }
          />
        ))
      ) : (
        <h1>{noCallsMessage}</h1>
      )}
    </div>
  );
}

export default CallList;
