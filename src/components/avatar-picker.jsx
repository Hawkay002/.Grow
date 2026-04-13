import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Replace these 'src' URLs with your own rectangular image paths!
export const avatars = [

    { id: 1, alt: "Chimères", src: "/avatar/Chimères.webp" },
    { id: 2, alt: "Résistance", src: "/avatar/Résistance.webp" },
    { id: 3, alt: "Le Danseur de Feu", src: "/avatar/Le Danseur de Feu.webp" },
    { id: 4, alt: "Prélude", src: "/avatar/Prélude.webp" },
    { id: 5, alt: "Awake", src: "/avatar/Awake.webp" },
    { id: 6, alt: "The Lost Souls", src: "/avatar/The Lost Souls.webp" },
    { id: 7, alt: "Tentaculus", src: "/avatar/Tentaculus.webp" },

];

// Silent Preloader: This runs once when the file is imported, 
// forcing the browser to cache the images before the user even opens the modal.
if (typeof window !== 'undefined') {
    avatars.forEach(avatar => {
        const img = new Image();
        img.src = avatar.src;
    });
}

const mainAvatarVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.2 } },
};

const pickerVariants = {
    container: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } },
    item: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } } },
};

const selectedVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

export function AvatarPicker({ currentAvatarId, onSave, onCancel, isSaving }) {
    const [selectedAvatar, setSelectedAvatar] = useState(
        avatars.find(a => a.id === currentAvatarId) || avatars[0]
    );

    const handleAvatarSelect = (avatar) => {
        if (selectedAvatar.id === avatar.id) return;
        setSelectedAvatar(avatar);
    };

    return (
        <motion.div initial="initial" animate="animate" className="w-full max-w-sm mx-auto relative z-50">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] overflow-hidden border border-slate-900/5 shadow-2xl relative">
                
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "8rem", transition: { height: { type: "spring", stiffness: 100, damping: 20 } } }}
                    className="bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 w-full"
                />

                <div className="px-6 pb-8 -mt-16 flex flex-col items-center">
                    
                    {/* MAIN PREVIEW IMAGE */}
                    <motion.div
                        className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-[6px] border-white bg-slate-100 shadow-lg ring-1 ring-slate-900/5"
                        variants={mainAvatarVariants}
                    >
                        <img 
                            src={selectedAvatar.src} 
                            alt={selectedAvatar.alt}
                            // object-cover forces the rectangular image to fill the circle vertically and crop the sides
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    <motion.div className="text-center mt-5 mb-6" variants={pickerVariants.item}>
                        <h2 className="text-2xl font-serif font-medium text-emerald-900 tracking-tight">Choose Avatar</h2>
                        <p className="text-slate-500 text-sm font-medium">Select a unique botanical identity.</p>
                    </motion.div>

                    {/* AVATAR GRID */}
                    <motion.div className="w-full" variants={pickerVariants.container}>
                        <motion.div className="flex flex-wrap justify-center gap-3" variants={pickerVariants.container}>
                            {avatars.map((avatar) => (
                                <motion.button
                                    key={avatar.id}
                                    onClick={() => handleAvatarSelect(avatar)}
                                    className={cn(
                                        "relative w-12 h-12 rounded-full overflow-hidden border-2 bg-slate-100",
                                        "transition-all duration-300 shadow-sm",
                                        selectedAvatar.id === avatar.id ? "border-transparent" : "border-slate-200 hover:border-slate-300"
                                    )}
                                    variants={pickerVariants.item}
                                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                                    whileTap={{ y: 0, transition: { duration: 0.2 } }}
                                    title={avatar.alt}
                                >
                                    <img 
                                        src={avatar.src} 
                                        alt={avatar.alt} 
                                        className="w-full h-full object-cover" 
                                    />
                                    {selectedAvatar.id === avatar.id && (
                                        <motion.div
                                            className="absolute inset-0 bg-emerald-900/20 border-[3px] border-emerald-500 rounded-full"
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

                    {/* CONTROLS */}
                    <div className="flex w-full gap-3 mt-8">
                        <button 
                            onClick={onCancel} disabled={isSaving}
                            className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-full font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onSave(selectedAvatar.id)} disabled={isSaving}
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
