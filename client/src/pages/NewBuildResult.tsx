import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { useAuth } from "A/_core/hooks/useAuth";
import {
  Home,
  Bath,
  ChefHat,
  BedDouble,
  Sofa,
  Wrench,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";

