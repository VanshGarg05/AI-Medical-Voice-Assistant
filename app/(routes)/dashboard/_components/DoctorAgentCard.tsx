'use client'
import Image from "next/image";
import React, { useState } from "react";
import AddNewSessionDialog from "./AddNewSessionDialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";

export type doctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId?: string;
  subscriptionRequired: boolean;
};

type props = {
  doctorAgent: doctorAgent;
};

function DoctorAgentCard({ doctorAgent }: props) {

  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const {has}=useAuth()
  
  const paidUser = has && has({plan:'pro'})

   const onStartConsultation = async () => {
    setLoading(true);
    const result = await axios.post("/api/session-chat", {
      notes: 'New Query',
      selectedDoctor:doctorAgent,
    });
    console.log(result.data);

    if (result.data?.sessionId) {
      console.log(result.data.sessionId);
      router.push("/dashboard/medical-agent/" + result.data.sessionId);
    }

    setLoading(false);
  };

  return (
    <div className="realtive">
      {doctorAgent?.subscriptionRequired && (
        <Badge className="absolute m-2  ">Premium</Badge>
      )}
      <Image
        src={doctorAgent.image}
        alt={doctorAgent.specialist}
        width={200}
        height={300}
        className="w-full h-[250px] object-cover rounded-xl"
      />
      <h2 className="font-bold mt-1 ">{doctorAgent.specialist}</h2>
      <p className="line-clamp-2 text-sm text-gray-500">
        {doctorAgent.description}
      </p>
      <Button onClick={onStartConsultation} className="w-full mt-2" disabled={!paidUser && doctorAgent.subscriptionRequired}> Start Consultation {loading?<Loader2 className="animate-spin"/>:<IconArrowRight/>}  </Button>
    </div>
  );
}

export default DoctorAgentCard;
