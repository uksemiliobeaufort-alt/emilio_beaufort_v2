import Link from "next/link";
import { Card, CardContent, Typography } from "@mui/material";
import { ArrowForward } from "@mui/icons-material"; // or any icon you're using

const cardData = [
  { title: "Cosmetics", link: "/products/cosmetics" },
  { title: "Hair", link: "/products/hair" },
  { title: "Emilio Global", desc: "This is the third card.", link:""},
  { title: "Journal", desc: "This is the fourth card.", link:""},
];

export default function CardGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="relative group transition-transform duration-300 transform hover:scale-105 border border-black hover:border-yellow-500 rounded-xl overflow-hidden min-h-[280px] hover:shadow-lg hover:shadow-yellow-500/30 p-4"
        >
          <Card className="bg-transparent shadow-none h-full">
            <CardContent>
              <Typography variant="h5" className="font-bold">
                {card.title}
              </Typography>
            </CardContent>

            {/* Arrow Icon with Link */}
            <Link href={card.link} passHref>
              <div className="absolute bottom-4 right-4 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-yellow-500 hover:text-yellow-600">
                <ArrowForward />
              </div>
            </Link>
          </Card>
        </div>
      ))}
    </div>
  );
}
