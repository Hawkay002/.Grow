import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export const avatars = [
    {
        id: 1,
        alt: "Emerald Oak",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="mask-av1" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#mask-av1)">
                    <rect width="36" height="36" fill="#d1fae5" /> {/* emerald-100 */}
                    <rect x="15" y="18" width="6" height="18" fill="#78350f" rx="2" /> {/* trunk */}
                    <circle cx="18" cy="15" r="11" fill="#10b981" /> {/* emerald-500 */}
                </g>
            </svg>
        ),
    },
    {
        id: 2,
        alt: "Midnight Pine",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="mask-av2" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#mask-av2)">
                    <rect width="36" height="36" fill="#dcfce7" /> {/* green-100 */}
                    <rect x="15" y="24" width="6" height="12" fill="#451a03" rx="1" /> {/* trunk */}
                    <path d="M18 6 L30 26 L6 26 Z" fill="#064e3b" strokeLinejoin="round" /> {/* emerald-900 */}
                </g>
            </svg>
        ),
    },
    {
        id: 3,
        alt: "Cherry Blossom",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="mask-av3" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#mask-av3)">
                    <rect width="36" height="36" fill="#fce7f3" /> {/* pink-100 */}
                    <rect x="15" y="18" width="6" height="18" fill="#4b2110" rx="2" /> {/* trunk */}
                    <circle cx="18" cy="13" r="9" fill="#f43f5e" /> {/* rose-500 */}
                    <circle cx="11" cy="18" r="7" fill="#fb7185" /> {/* rose-400 */}
                    <circle cx="25" cy="18" r="7" fill="#fb7185" /> {/* rose-400 */}
                </g>
            </svg>
        ),
    },
    {
        id: 4,
        alt: "Autumn Maple",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="mask-av4" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#mask-av4)">
                    <rect width="36" height="36" fill="#ffedd5" /> {/* orange-100 */}
                    <rect x="15" y="18" width="6" height="18" fill="#431407" rx="2" /> {/* trunk */}
                    <circle cx="18" cy="13" r="8" fill="#ea580c" /> {/* orange-600 */}
                    <circle cx="12" cy="19" r="7" fill="#f97316" /> {/* orange-500 */}
                    <circle cx="24" cy="19" r="7" fill="#f97316" /> {/* orange-500 */}
                    <circle cx="18" cy="23" r="5" fill="#fdba74" /> {/* orange-300 */}
                </g>
            </svg>
        ),
    },
    {
        id: 5,
        alt: "Desert Cactus",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="mask-av5" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#mask-av5)">
                    <rect width="36" height="36" fill="#fef9c3" /> {/* yellow-100 */}
                    <rect x="13" y="12" width="10" height="24" fill="#65a30d" rx="5" /> {/* main body */}
                    <rect x="8" y="16" width="6" height="12" fill="#84cc16" rx="3" /> {/* left arm */}
                    <rect x="22" y="14" width="6" height="10" fill="#84cc16" rx="3" /> {/* right arm */}
                </g>
            </svg>
        ),
    },
    {
        id: 6,
        alt: "Twilight Baobab",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="mask-av6" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#mask-av6)">
                    <rect width="36" height="36" fill="#e0e7ff" /> {/* indigo-100 */}
                    <rect x="12" y="18" width="12" height="18" fill="#1e1b4b" rx="4" /> {/* thick trunk */}
                    <ellipse cx="18" cy="16" rx="14" ry="6" fill="#4338ca" /> {/* flat canopy */}
                </g>
            </svg>
        ),
    },
    {
        id: 7,
        alt: "Golden Birch",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="mask-av7" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#mask-av7)">
                    <rect width="36" height="36" fill="#fef08a" /> {/* yellow-200 */}
                    <rect x="15" y="15" width="6" height="21" fill="#f8fafc" rx="2" /> {/* white trunk */}
                    <rect x="15" y="20" width="4" height="2" fill="#cbd5e1" /> {/* trunk detail */}
                    <rect x="17" y="26" width="4" height="2" fill="#cbd5e1" /> {/* trunk detail */}
                    <circle cx="18" cy="14" r="10" fill="#eab308" /> {/* yellow-500 canopy */}
                </g>
            </svg>
        ),
    },
];

const mainAvatarVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.2 } },
};

const pickerVariants = {
    container: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
    },
    item: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
    },
};

const selectedVariants = {
    initial: { opacity: 0, rotate: -180 },
    animate: { opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 15 } },
    exit: { opacity: 0, rotate: 180, transition: { duration: 0.2 } },
};

export function AvatarPicker({ currentAvatarId, onSave, onCancel, isSaving }) {
    const [selectedAvatar, setSelectedAvatar] = useState(
        avatars.find(a => a.id === currentAvatarId) || avatars[0]
    );
    const [rotationCount, setRotationCount] = useState(0);

    const handleAvatarSelect = (avatar) => {
        if (selectedAvatar.id === avatar.id) return;
        setRotationCount((prev) => prev + 1080); // 3 rotations
        setSelectedAvatar(avatar);
    };

    return (
        <motion.div initial="initial" animate="animate" className="w-full max-w-sm mx-auto relative z-50">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] overflow-hidden border border-slate-900/5 shadow-2xl relative">
                
                {/* Animated Background Header updated to Grow-Voxly colors */}
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                        opacity: 1,
                        height: "8rem",
                        transition: { height: { type: "spring", stiffness: 100, damping: 20 } },
                    }}
                    className="bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 w-full"
                />

                <div className="px-6 pb-8 -mt-16 flex flex-col items-center">
                    
                    {/* Main Rotating Avatar Display */}
                    <motion.div
                        className="relative w-32 h-32 mx-auto rounded-[2rem] overflow-hidden border-[6px] border-white bg-slate-50 flex items-center justify-center shadow-lg ring-1 ring-slate-900/5"
                        variants={mainAvatarVariants}
                    >
                        <motion.div
                            className="w-full h-full flex items-center justify-center p-2"
                            animate={{ rotate: rotationCount }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {selectedAvatar.svg}
                        </motion.div>
                    </motion.div>

                    <motion.div className="text-center mt-5 mb-6" variants={pickerVariants.item}>
                        <h2 className="text-2xl font-serif font-medium text-emerald-900 tracking-tight">Choose Avatar</h2>
                        <p className="text-slate-500 text-sm font-medium">Select a unique botanical identity.</p>
                    </motion.div>

                    {/* Avatar Grid Selection */}
                    <motion.div className="w-full" variants={pickerVariants.container}>
                        <motion.div className="flex flex-wrap justify-center gap-3" variants={pickerVariants.container}>
                            {avatars.map((avatar) => (
                                <motion.button
                                    key={avatar.id}
                                    onClick={() => handleAvatarSelect(avatar)}
                                    className={cn(
                                        "relative w-12 h-12 rounded-2xl overflow-hidden border-2 bg-slate-50",
                                        "transition-all duration-300 shadow-sm",
                                        selectedAvatar.id === avatar.id ? "border-transparent" : "border-slate-200 hover:border-slate-300"
                                    )}
                                    variants={pickerVariants.item}
                                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                    whileTap={{ y: 0, transition: { duration: 0.2 } }}
                                    aria-label={`Select ${avatar.alt}`}
                                    title={avatar.alt}
                                >
                                    <div className="w-full h-full flex items-center justify-center p-1">
                                        {avatar.svg}
                                    </div>
                                    {selectedAvatar.id === avatar.id && (
                                        <motion.div
                                            className="absolute inset-0 bg-emerald-900/10 border-2 border-emerald-600 rounded-2xl"
                                            variants={selectedVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Controls */}
                    <div className="flex w-full gap-3 mt-8">
                        <button 
                            onClick={onCancel} 
                            disabled={isSaving}
                            className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-full font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onSave(selectedAvatar.id)} 
                            disabled={isSaving}
                            className="flex-1 bg-slate-900 text-white py-3.5 rounded-full font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Avatar'}
                        </button>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
