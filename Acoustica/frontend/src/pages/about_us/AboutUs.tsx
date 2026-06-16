import arana from '@/assets/images/about_us/arana.jpeg';
import shanon from '@/assets/images/about_us/shanon.jpg';
import '@/pages/about_us/AboutUs.css';

interface MemberCardProps {
    image: string;
    name: string;
    role: string;
    email: string;
    delay: string;
}

function MemberCard({ image, name, role, email, delay }: MemberCardProps) {
    return (
        <div className="au-card" style={{ animationDelay: delay }}>
            <div className="au-card-img-wrap">
                <img src={image} alt={name} className="au-card-img" />
                <div className="au-card-img-ring" />
            </div>
            <div className="au-card-info">
                <span className="au-card-name">{name}</span>
                <span className="au-card-role">{role}</span>
                <a
                    className="au-card-email"
                    href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Send email to ${name}`}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    {email}
                </a>
            </div>
        </div>
    );
}

export default function AboutUs() {
    return (
        <div id="au-container">

            <div className="au-header">
                <h1>About Us</h1>
            </div>

            <p className="au-description">
                This web application is developed as our term project for <p><b>CSE 216: DBMS Sessional</b></p> course in Term-1 Level-2,  
                using Flask for backend, React and Typescript for frontend, PostgreSQL for database and cloud services.  
                Please feel free to reach out to us if you have any queries.
            </p>

            <div className="au-members">
                <MemberCard
                    image={shanon}
                    name="Shadman Sami"
                    role="Student at CSE, BUET"
                    email="shadmansami3s@gmail.com"
                    delay="0.1s"
                />
                <MemberCard
                    image={arana}
                    name="Ramisa Raidah Arana"
                    role="Student at CSE, BUET"
                    email="ramisaraidah@gmail.com"
                    delay="0.2s"
                />
            </div>

            <div className="au-supervisor">
                <span className="au-supervisor-label">Supervised by</span>
                <span className="au-supervisor-name">Kowshic Roy</span>
                <span className="au-supervisor-title">Lecturer, CSE, BUET</span>
            </div>

        </div>
    );
}