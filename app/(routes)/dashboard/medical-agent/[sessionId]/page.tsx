"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, Loader2, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
  userDetail?: any;
};

type messages = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>();
  const [currentRole, setCurrentRole] = useState<string | null>();
  const [liveTanscript, setLiveTanscript] = useState<string>();
  const [messages, setMessages] = useState<messages[]>([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [start, setStart] = useState(false);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    sessionId && GetSessionDetails();
  }, [sessionId]);

  const GetSessionDetails = async () => {
    const result = await axios.get("/api/session-chat?sessionId=" + sessionId);
    console.log(result.data);
    setSessionDetail(result.data);
  };

  // Fixed timer useEffect
  useEffect(() => {
    if (start) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start new timer
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      // Clear timer when stopped
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [start]);

  const handleCallStart = useCallback(() => {
    setLoading(false);
    console.log("Call started");
    setCallStarted(true);
  }, []);

  const handleCallEnd = useCallback(() => {
    setCallStarted(false);
    setStart(false); // Stop the timer when call ends
    setTime(0); // Reset timer
    console.log("Call ended");
  }, []);

  const handleMessage = useCallback((message: any) => {
    if (message.type === "transcript") {
      const { role, transcriptType, transcript } = message;
      console.log(`${role}: ${transcript}`);
      if (transcriptType === "partial") {
        setLiveTanscript(transcript);
        setCurrentRole(role);
      } else if (transcriptType === "final") {
        setMessages((prev) => [...prev, { role, text: transcript }]);
        setLiveTanscript("");
        setCurrentRole(null);
      }
    }
  }, []);

  const StartCall = async () => {
    setLoading(true);
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    
    setVapiInstance(vapi);
    
    const VapiAgentConfig = {
      name: "AI Medical Doctor Voice Agent",
      firstMessage:
      "Hello, Thank You for connecting, Can you please tell me your full name and age",
      transcriber: {
        provider: "assembly-ai",
        language: "en",
      },
      voice: {
        provider: "playht",
        voiceId: "will",
      },
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: sessionDetail?.selectedDoctor?.agentPrompt,
          },
        ],
      },
    };
    //@ts-ignore
    vapi.start(VapiAgentConfig);
    
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    setStart(true); // Start the timer
    
    vapi.on("speech-start", () => {
      console.log("Assistant started speaking");
      setCurrentRole("assistant");
    });
    vapi.on("speech-end", () => {
      console.log("Assistant stopped speaking");
      setCurrentRole("user");
    });
  };

  const endCall = async () => {
    setLoading(true);
    setStart(false); // Stop the timer
    if (!vapiInstance) {
      setLoading(false);
      return;
    }
    await vapiInstance.stop();

    vapiInstance.off("call-start", handleCallStart);
    vapiInstance.off("call-end", handleCallEnd);
    vapiInstance.off("message", handleMessage);

    // Reset call state
    setCallStarted(false);
    setVapiInstance(null);
    setTime(0); // Reset timer

    const result = await GenerateReport();
    toast.success('Your report is Generated');
    router.replace('/dashboard');

    setLoading(false);
  };

  const GenerateReport = async () => {
    const result = await axios.post("/api/medical-report", {
      messages: messages,
      sessionDetail: sessionDetail,
      sessionId,
      userDetail: sessionDetail?.userDetail // Pass user details from session
    });
    console.log(result.data);
    return result.data;
  };

  // Helper function to format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-5 border rounded-3xl bg-secondary">
      <div className="flex justify-between items-center">
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
          {" "}
          <Circle
            className={`h-4 w-4 rounded-full ${
              callStarted ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {callStarted ? "Connected..." : "Not Connected"}
        </h2>
        <h2 className="font-bold text-xl text-gray-400">{formatTime(time)}</h2>
      </div>
      {sessionDetail && (
        <div className="flex items-center flex-col mt-10">
          <Image
            src={sessionDetail?.selectedDoctor?.image}
            alt={sessionDetail?.selectedDoctor?.specialist || " "}
            width={120}
            height={120}
            className="h-[100px] w-[100px] object-cover rounded-full"
          />
          <h2 className="mt-2 text-lg">
            {sessionDetail?.selectedDoctor?.specialist}
          </h2>
          <p className="text-sm text-gray-400">AI Medical Voice Agent</p>

          <div className="mt-12 overflow-y-auto flex flex-col items-center px:10 md:px-28 lg:px-52 xl:px-72">
            {messages?.slice(-4).map((msg, index) => (
              <h2 className="text-gray-400 p-2" key={index}>
                {msg.role}:{msg.text}
              </h2>
            ))}
            {liveTanscript && liveTanscript?.length > 0 && (
              <h2 className="text-lg">
                {currentRole}:{liveTanscript}
              </h2>
            )}
          </div>
          {!callStarted ? (
            <Button onClick={StartCall} className="mt-20" disabled={loading}>
              {" "}
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <PhoneCall />
              )}{" "}
              Start Call
            </Button>
          ) : (
            <Button
              variant={"destructive"}
              onClick={endCall}
              disabled={loading}
            >
              {" "}
              {loading ? <Loader2 className="animate-spin" /> : <PhoneOff />}
              Disconnect
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;