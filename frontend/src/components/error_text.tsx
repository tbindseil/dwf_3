export interface ErrorTextProps {
  inError: boolean;
  message: string;
}

export function ErrorText(props: ErrorTextProps) {
  if (props.inError) {
    return <p>{props.message}</p>;
  } else {
    return null;
  }
}
