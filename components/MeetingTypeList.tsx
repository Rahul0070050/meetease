"use client";

import Image from "next/image";
import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import MeetingModal from "./MeetingModal";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import { useToast } from "./ui/use-toast";
import { Textarea } from "./ui/textarea";
import ReactDatePicker from "react-datepicker";

function MeetingTypeList() {
  const { toast } = useToast();

  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const router = useRouter();

  const [callDetails, setCallDetails] = useState<Call>();

  const { user, isLoaded } = useUser();
  const client = useStreamVideoClient();

  async function createMeeting() {
    if (!client || !user) return;

    try {
      if (!values.dateTime) {
        toast({
          title: "Please select a Date and Time",
        });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call("default", id);

      if (!call) throw new Error("Failed to create call");

      const startsAt =
        values.dateTime.toISOString() || new Date().toISOString();
      const description = values.description || "Instant meeting";
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetails(call);
      toast({
        title: "Meeting created",
      });
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
    } catch (error) {
      // console.log(error);
      toast({
        title: "Failed to create meeting",
      });
    }
  }
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("isInstantMeeting")}
        className="bg-orange-1"
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plane your meeting"
        handleClick={() => setMeetingState("isScheduleMeeting")}
        className="bg-blue-1"
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Check out your recordings"
        handleClick={() => router.push("/recordings")}
        className="bg-purple-1"
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="Via invitation link"
        handleClick={() => setMeetingState("isJoiningMeeting")}
        className="bg-yellow-1"
      />
      {!callDetails ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create meeting"
          buttonText="Start Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label
              htmlFor=""
              className="text-base text-normal leading-[22px] text-shy-2"
            >
              Add a description
            </label>
            <Textarea
              className="border-none bg-dark-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => {
                setValues({ ...values, description: e.target.value });
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label
              htmlFor=""
              className="text-base text-normal leading-[22px] text-shy-2"
            >
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:MM:"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded bg-dark-2 p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          title="Meeting Created"
          className="text-center"
          buttonText="Copy Meeting Link"
          buttonIcon="/icons/copy.svg"
          onClose={() => setMeetingState(undefined)}
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Link Copied",
            });
          }}
          image="/icons/checked.svg"
        />
      )}
      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        title="Start an instant meeting"
        className="text-center"
        buttonIcon=""
        children
        image=""
        buttonText="Start Meeting"
        onClose={() => setMeetingState(undefined)}
        handleClick={createMeeting}
      />
    </section>
  );
}

export default MeetingTypeList;
