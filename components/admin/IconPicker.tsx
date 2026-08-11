"use client";

import React, { useState } from "react";
import { 
  // Electronics & Tech
  Monitor, Smartphone, Gamepad, Speaker, Tv, Wifi, Printer, Home, Plug, HardDrive, 
  Laptop, Cpu, Keyboard, Mouse, Watch, Tablet, Headphones, Camera, Battery, Server, 
  Database, Cloud, Signal, Power, Zap, Radio, Router, Calculator,

  // Office & Business
  Briefcase, Shield, List, Tag, Handshake, ShoppingCart, CreditCard, Gift, Truck, 
  User, Settings, Search, X, File, Folder, Paperclip, Archive, Calendar, Clock, 
  Mail, Phone, Percent, DollarSign, BarChart, PieChart, TrendingUp,

  // Furniture & Home
  Armchair, Sofa, Bed, Lamp, Table, DoorOpen, Bath, Box, Package, 

  // Tools & Construction
  Wrench, Hammer, Drill, Construction, PaintBucket, Ruler, Scissors, Axe, Shovel,

  // Fashion & Clothing
  Shirt, Watch as WatchIcon, Glasses, Umbrella,

  // Transport & Maps
  Car, Bike, Plane, Ship, MapPin, Navigation, Map, Globe, Anchor, Compass,

  // Food & Drink
  Coffee, Utensils, Pizza, Wine, Beer, CakeSlice, Apple, Carrot,

  // Health & Sports
  Dumbbell, Activity, Stethoscope, Pill, Syringe, Heart, Medal, Trophy, Bike as BikeIcon,

  // Nature & Outdoor
  Sun, Moon, CloudRain, Leaf, Flower, TreeDeciduous, Mountain, Tent, Flame, Droplets,

  // Kids & Pets
  Baby, Cat, Dog, Fish, Bird, Bone,

  // Misc & UI
  Star, ThumbsUp, Award, Crown, Diamond, Key, Lock, Unlock, Eye, EyeOff, Bell, 
  Music, Video, Image, Film, Book, GraduationCap, Ghost, Smile, Flag,
  Gamepad2, Cable, RefreshCcw, Usb, Backpack, Lightbulb, Fan, Network, ToggleLeft, Disc, Mic, Square, PenTool, FileText, Move, Copy, Droplet, Cylinder, Scan, Aperture, CircuitBoard, MemoryStick, Feather
} from "lucide-react";

export const ICON_LIST = [
  // Electronics
  { name: "Monitor", icon: Monitor },
  { name: "Smartphone", icon: Smartphone },
  { name: "Tablet", icon: Tablet },
  { name: "Laptop", icon: Laptop },
  { name: "Watch", icon: Watch },
  { name: "Headphones", icon: Headphones },
  { name: "Camera", icon: Camera },
  { name: "Gamepad", icon: Gamepad },
  { name: "Speaker", icon: Speaker },
  { name: "Tv", icon: Tv },
  { name: "Printer", icon: Printer },
  { name: "Keyboard", icon: Keyboard },
  { name: "Mouse", icon: Mouse },
  { name: "Cpu", icon: Cpu },
  { name: "HardDrive", icon: HardDrive },
  { name: "Wifi", icon: Wifi },
  { name: "Router", icon: Router },
  { name: "Server", icon: Server },
  { name: "Database", icon: Database },
  { name: "Cloud", icon: Cloud },
  { name: "Battery", icon: Battery },
  { name: "Power", icon: Power },
  { name: "Zap", icon: Zap },
  { name: "Radio", icon: Radio },

  // Home & Furniture
  { name: "Home", icon: Home },
  { name: "Armchair", icon: Armchair },
  { name: "Sofa", icon: Sofa },
  { name: "Bed", icon: Bed },
  { name: "Lamp", icon: Lamp },
  { name: "Table", icon: Table },
  { name: "Door", icon: DoorOpen },
  { name: "Bath", icon: Bath },
  { name: "Box", icon: Box },
  { name: "Package", icon: Package },

  // Tools
  { name: "Wrench", icon: Wrench },
  { name: "Hammer", icon: Hammer },
  { name: "Drill", icon: Drill },
  { name: "Construction", icon: Construction },
  { name: "PaintBucket", icon: PaintBucket },
  { name: "Ruler", icon: Ruler },
  { name: "Scissors", icon: Scissors },
  { name: "Axe", icon: Axe },
  { name: "Shovel", icon: Shovel },
  { name: "Plug", icon: Plug },

  // Business & Office
  { name: "Briefcase", icon: Briefcase },
  { name: "Calculator", icon: Calculator },
  { name: "File", icon: File },
  { name: "Folder", icon: Folder },
  { name: "Archive", icon: Archive },
  { name: "Paperclip", icon: Paperclip },
  { name: "Calendar", icon: Calendar },
  { name: "Clock", icon: Clock },
  { name: "Mail", icon: Mail },
  { name: "Phone", icon: Phone },
  { name: "Handshake", icon: Handshake },
  { name: "Percent", icon: Percent },
  { name: "Dollar", icon: DollarSign },
  { name: "Chart", icon: BarChart },
  { name: "PieChart", icon: PieChart },
  { name: "Trending", icon: TrendingUp },

  // Commerce
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "CreditCard", icon: CreditCard },
  { name: "Tag", icon: Tag },
  { name: "Gift", icon: Gift },
  { name: "Truck", icon: Truck },
  { name: "List", icon: List },
  { name: "Shield", icon: Shield },
  { name: "User", icon: User },
  { name: "Settings", icon: Settings },

  // Transport
  { name: "Car", icon: Car },
  { name: "Bike", icon: Bike },
  { name: "Plane", icon: Plane },
  { name: "Ship", icon: Ship },
  { name: "MapPin", icon: MapPin },
  { name: "Map", icon: Map },
  { name: "Globe", icon: Globe },
  { name: "Navigation", icon: Navigation },
  { name: "Compass", icon: Compass },
  { name: "Anchor", icon: Anchor },

  // Fashion
  { name: "Shirt", icon: Shirt },
  { name: "Glasses", icon: Glasses },
  { name: "Umbrella", icon: Umbrella },

  // Food
  { name: "Coffee", icon: Coffee },
  { name: "Utensils", icon: Utensils },
  { name: "Pizza", icon: Pizza },
  { name: "Wine", icon: Wine },
  { name: "Beer", icon: Beer },
  { name: "Cake", icon: CakeSlice },
  { name: "Apple", icon: Apple },
  { name: "Carrot", icon: Carrot },

  // Health & Sports
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Activity", icon: Activity },
  { name: "Heart", icon: Heart },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "Pill", icon: Pill },
  { name: "Syringe", icon: Syringe },
  { name: "Medal", icon: Medal },
  { name: "Trophy", icon: Trophy },

  // Nature
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "CloudRain", icon: CloudRain },
  { name: "Leaf", icon: Leaf },
  { name: "Flower", icon: Flower },
  { name: "Tree", icon: TreeDeciduous },
  { name: "Mountain", icon: Mountain },
  { name: "Tent", icon: Tent },
  { name: "Flame", icon: Flame },
  { name: "Water", icon: Droplets },

  // Kids & Pets
  { name: "Baby", icon: Baby },
  { name: "Cat", icon: Cat },
  { name: "Dog", icon: Dog },
  { name: "Fish", icon: Fish },
  { name: "Bird", icon: Bird },
  { name: "Bone", icon: Bone },

  // Misc
  { name: "Star", icon: Star },
  { name: "ThumbsUp", icon: ThumbsUp },
  { name: "Award", icon: Award },
  { name: "Crown", icon: Crown },
  { name: "Diamond", icon: Diamond },
  { name: "Key", icon: Key },
  { name: "Lock", icon: Lock },
  { name: "Unlock", icon: Unlock },
  { name: "Eye", icon: Eye },
  { name: "EyeOff", icon: EyeOff },
  { name: "Bell", icon: Bell },
  { name: "Music", icon: Music },
  { name: "Video", icon: Video },
  { name: "Image", icon: Image },
  { name: "Film", icon: Film },
  { name: "Book", icon: Book },
  { name: "Graduation", icon: GraduationCap },
  { name: "Ghost", icon: Ghost },
  { name: "Smile", icon: Smile },
  { name: "Flag", icon: Flag },

  // Added from Seed
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Cable", icon: Cable },
  { name: "RefreshCcw", icon: RefreshCcw },
  { name: "Usb", icon: Usb },
  { name: "Backpack", icon: Backpack },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Fan", icon: Fan },
  { name: "Network", icon: Network },
  { name: "ToggleLeft", icon: ToggleLeft },
  { name: "Disc", icon: Disc },
  { name: "Mic", icon: Mic },
  { name: "Square", icon: Square },
  { name: "PenTool", icon: PenTool },
  { name: "FileText", icon: FileText },
  { name: "Move", icon: Move },
  { name: "Copy", icon: Copy },
  { name: "Droplet", icon: Droplet },
  { name: "Cylinder", icon: Cylinder },
  { name: "Scan", icon: Scan },
  { name: "Aperture", icon: Aperture },
  { name: "CircuitBoard", icon: CircuitBoard },
  { name: "MemoryStick", icon: MemoryStick },
  { name: "Feather", icon: Feather },
];

interface IconPickerProps {
  selectedIcon: string | null;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

export default function IconPicker({ selectedIcon, onSelect, onClose }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = ICON_LIST.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col max-h-96">
      <div className="p-3 border-b border-gray-100 flex items-center gap-2 sticky top-0 bg-white rounded-t-lg z-10">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ícone..."
            className="w-full pl-7 pr-2 py-1 text-sm border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-6 gap-1">
        {filteredIcons.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => {
              onSelect(name);
              onClose();
            }}
            className={`p-2 rounded hover:bg-gray-100 flex flex-col items-center justify-center gap-1 title-md ${selectedIcon === name ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-600'}`}
            title={name}
          >
            <Icon size={20} />
          </button>
        ))}
        {filteredIcons.length === 0 && (
          <div className="col-span-6 text-center py-4 text-xs text-gray-400">
            Nenhum ícone encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
