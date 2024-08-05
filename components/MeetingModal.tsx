import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  image?: string;
  buttonClassName?: string;
  buttonIcon?: string;
}
function MeetingModal({
  isOpen,
  title,
  className,
  buttonText,
  buttonIcon,
  children,
  image,
  onClose,
  handleClick,
}: MeetingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[520px] flex-col gap-6 border-none bg-dark-1 px-6 py-9 text-white">
        <div className="flex flex-cal gap-6 justify-center">
          {image && (
            <div className="flex justify-center">
              <Image src={image} alt={image} width={72} height={72} />
            </div>
          )}
        </div>
        <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
          {title}
        </h1>
        {children}
        <Button
          className="bg-blue-1 focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={handleClick}
        >
          {buttonIcon && (
            <Image src={buttonIcon} alt="button icon" width={13} height={13} />
          )}{" "}
          &nbsp;
          {buttonText || "Schedule Meeting"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default MeetingModal;
