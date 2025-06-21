import { Check, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface BenefitsCardProps {
  title: string;
  description: string;
  content: string[];
}

function StreamerGuideBenefitsCard({
  title,
  description,
  content,
}: BenefitsCardProps) {
  return (
    <Card className="gaming-card">
      <CardHeader>
        <Users className="h-10 w-10 text-primary mb-2" />
        <CardTitle className="gaming-text-accent">{title}</CardTitle>
        <CardDescription className="gaming-text-secondary">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {content.map((item, idx) => (
            <li
              key={"StreamerGuideBenefitsCard-" + idx}
              className="text-lg flex items-start gap-2"
            >
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="gaming-text-accent">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default StreamerGuideBenefitsCard;
