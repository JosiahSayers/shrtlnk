import { Link } from "remix";

interface CardProps {
  title: string;
  text: string;
  linkUrl: string;
  linkText: string;
}

export default function Card({ title, text, linkUrl, linkText }: CardProps) {
  return (
    <div className="card text-center">
      <div className="card-body">
        <div>
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{text}</p>
        </div>
        <Link to={linkUrl} className="btn btn-primary">
          {linkText}
        </Link>
      </div>
    </div>
  );
}
