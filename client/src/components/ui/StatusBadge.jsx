import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { statusColor } from '../../utils/constants';

const StatusBadge = ({ status, label, className }) => {
  const { t } = useTranslation();
  const text = label ?? (t(`common.${status}`, { defaultValue: status }));
  return <span className={clsx('chip', statusColor(status), className)}>{text}</span>;
};

export default StatusBadge;
