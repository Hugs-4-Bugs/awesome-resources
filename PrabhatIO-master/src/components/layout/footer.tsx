
import { Socials } from '../socials';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container py-8 flex flex-col items-center justify-center gap-6">
         <div>
            <h3 className="text-center font-semibold text-lg mb-4">Connect With Me</h3>
            <Socials />
         </div>
        <p className="text-sm text-muted-foreground text-center">
          &copy; {currentYear} Prabhat Kumar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
