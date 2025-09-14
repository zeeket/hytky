import Link from 'next/link';
import TelegramIcon from '../../public/telegram.svg';

const InfoChannelButton = ({
  text,
  infochannellink,
}: {
  text: string;
  infochannellink: string;
}) => {
  return (
    <div>
      <Link
        href={infochannellink}
        className="bg-telegram-blue my-2 box-border flex items-center space-x-2 rounded-md p-2 text-sm text-white"
      >
        <span className="inline-block">
          <TelegramIcon className="h-5 w-5" />
        </span>
        <span>{text}</span>
      </Link>
    </div>
  );
};

export default InfoChannelButton;
