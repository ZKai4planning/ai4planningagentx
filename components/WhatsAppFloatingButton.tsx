// "use client"

// import { MessageCircle } from "lucide-react"

// interface WhatsAppFloatingButtonProps {
//   phoneNumber: string // country code required, no +
//   message?: string
// }

// export default function WhatsAppFloatingButton({
//   phoneNumber,
//   message = "Hello! I have a query regarding my application.",
// }: WhatsAppFloatingButtonProps) {
//   const handleClick = () => {
//     const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
//       message
//     )}`
//     window.open(url, "_blank")
//   }

//   return (
//     <button
//       onClick={handleClick}
//       aria-label="Chat on WhatsApp"
//       className="
//         fixed bottom-6 right-6 z-50
//         h-14 w-14
//         rounded-full
//         bg-emerald-500
//         text-white
//         shadow-lg
//         flex items-center justify-center
//         hover:bg-emerald-600
//         hover:scale-105
//         active:scale-95
//         transition-all
//       "
//     >
//       <MessageCircle size={26} />
//     </button>
//   )
// }
