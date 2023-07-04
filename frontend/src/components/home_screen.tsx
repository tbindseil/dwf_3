import { useNavigate } from 'react-router-dom';

export function HomeScreen() {
  const navigate = useNavigate();
  const go = (url: string) => {
    navigate(url);
  };

  return (
    <div className='Home'>
      <p>
        <button
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event;
            go('/pictures');
          }}
        >
          Pictures
        </button>
      </p>
      <p>
        <button
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event;
            go('/new-picture');
          }}
        >
          New Picture
        </button>
      </p>
    </div>
  );
}
