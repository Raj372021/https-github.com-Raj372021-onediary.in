sed -i 's/<h1 className="text-3xl font-extrabold leading-tight tracking-tight drop-shadow-md">/<h1 className="text-xl font-bold leading-tight drop-shadow-md">/g' src/pages/WorkerDetail.tsx

sed -i 's/<MessageCircle size={18} className="mr-2" \/>/<MessageCircle size={14} className="mr-1" \/>/g' src/pages/WorkerDetail.tsx
sed -i 's/WhatsApp Rasid/WhatsApp/g' src/pages/WorkerDetail.tsx
sed -i 's/<Smartphone size={18} className="mr-2 text-blue-600" \/>/<Smartphone size={14} className="mr-1 text-blue-600" \/>/g' src/pages/WorkerDetail.tsx

sed -i '/<button /,/<\/button>/!b;//!d;/<CreditCard className="mr-3" size={24} \/>/!b;//!d;/<CreditCard/!b;//!d' src/pages/WorkerDetail.tsx
