
import Link from "next/link";
import TelegramIcon from "../../public/telegram.svg"

const InfoChannelButton = ({ text, infochannellink }: { text:string, infochannellink:string}) => {
    return (
    <div>
        <Link href={infochannellink} className="flex items-center rounded-md box-border bg-telegram-blue text-white text-sm p-2 space-x-2 my-2">
        <span className="inline-block"><TelegramIcon className="h-5 w-5" /></span>
        <span>{text}</span>
        </Link>
    </div>
    )
}

export default InfoChannelButton;