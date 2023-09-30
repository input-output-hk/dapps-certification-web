const StatusIcon: React.FC<{
    iconName: string;
    altText?: string;
  }> = ({
    iconName,
    altText,
    ...props
  }) => {

    return <img
        className="image"
        src={`/images/${iconName}.svg`}
        alt={altText || (iconName)}
        {...props}
    />
}

export default StatusIcon