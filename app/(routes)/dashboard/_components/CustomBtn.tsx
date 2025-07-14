interface CustomBtnInterFace {
    text: string;
}

export const CustomBtn = ({ text }: CustomBtnInterFace) => {
  return (
    <span className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 rounded-lg">{text}</span>
  )
}
