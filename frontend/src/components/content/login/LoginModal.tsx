import { type FC, useContext, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import type { UserData } from '../../../data/types.ts';
import { postCreateUser, postLogIn } from '../../../utils/api/post.ts';
import { getTodayAsIsoString } from '../../../utils/date.ts';
import { sendErrorMessage } from '../../../utils/notifications.ts';
import { AppContext } from '../../AppContext.tsx';
import { DateFormInput } from '../../miscellaneous/DateFormInput.tsx';

type RegisterOrLogin = 'register' | 'login';

export const LoginForm = () => {
    const { setUserId } = useContext(AppContext);

    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const [state, setState] = useState<RegisterOrLogin>('login');
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

    const [user, setUser] = useState<UserData>({
        userName: '',
        password: '',
        birthDate: getTodayAsIsoString(),
        gender: 'M',
        token: 0,
    });

    const updateUser = (field: keyof UserData, val: string) => {
        setUser((prev) => ({
            ...prev,
            [field]: val,
        }));
    };

    const handleRegister = () => {
        if (state === 'login') setState('register');
        else {
            if (!privacyAccepted) {
                sendErrorMessage('Bitte akzeptiere die Datenschutzerklärung.');
                return;
            }

            if (!captchaValue) {
                sendErrorMessage('Bitte Captcha ausfüllen.');
                return;
            }

            postCreateUser(user).then((res) => {
                if (res.success)
                    postLogIn(user.userName, user.password, captchaValue).then((res) => {
                        if (res.success) setUserId(res.user.id);
                    });
            });
        }
    };

    const logUserIn = () => {
        if (state === 'register') setState('login');
        else {
            if (!captchaValue) {
                sendErrorMessage('Bitte Captcha ausfüllen.');
                return;
            }

            postLogIn(user.userName, user.password, captchaValue).then((res) => {
                if (res.success) setUserId(res.user.id);
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    {state === 'register' ? 'Registrierung' : 'Login'}
                </h2>

                <form className="grid gap-4">
                    <LoginFormInput
                        lable={'Benutzer'}
                        value={user.userName}
                        password={false}
                        onValueChange={(val) => updateUser('userName', val)}
                    />

                    <LoginFormInput
                        lable={'Passwort'}
                        value={user.password}
                        password={true}
                        onValueChange={(val) => updateUser('password', val)}
                    />

                    {state === 'register' && (
                        <>
                            <DateFormInput
                                label={'Geburtstag'}
                                value={user.birthDate}
                                onChange={(val) => updateUser('birthDate', val)}
                            />

                            <LoginFormSelect
                                label={'Geschlecht'}
                                value={user.gender}
                                options={[
                                    { key: 'Männlich', value: 'M' },
                                    { key: 'Weiblich', value: 'W' },
                                    { key: 'Divers', value: 'D' },
                                ]}
                                onValueChange={(val) => updateUser('gender', val)}
                            />

                            <LoginFormInput
                                lable={'Token'}
                                value={user.token === 0 ? '' : user.token}
                                type={'number'}
                                password={false}
                                onValueChange={(val) => updateUser('token', val)}   
                            />
                            <div></div>

                            {/* DSGVO Checkbox */}
                            <div className="border rounded-xl p-3 bg-gray-50 text-sm">
                                Grundsätzlich gilt die Datenschutzerklärung unter <a href='https://www.vfl-rethwisch.de/datenschutz/'>https://www.vfl-rethwisch.de/datenschutz/</a>
Mit der Nutzung dieser WebApp erklärst du dich darüber hinaus mit der Verarbeitung deiner personenbezogenen Daten gemäß dieser Erklärungen einverstanden. 
1. Welche Daten werden gespeichert?
Im Rahmen der Lauf-Challenge werden folgende personenbezogene Daten verarbeitet und gespeichert:
Bei der Registrierung:
•	Name
•	Geburtsdatum
•	Geschlecht
•	Passwort 
•	Zeitpunkt der Account-Erstellung 
Bei der Nutzung der Lauf-Challenge:
•	Datum und Uhrzeit der Erfassung eines Laufs
•	Laufstrecke
•	Datum des gelaufenen Laufs
•	Screenshot aus einer Tracking-App
<br></br>
2. Zweck der Datenverarbeitung
Die Daten werden ausschließlich verwendet für:
•	die Teilnahme an der Lauf-Challenge
•	die Berechnung von Ranglisten und Statistiken
•	die Anzeige der Laufdaten für Teilnehmer der Laufchallenge
•	den fairen Vergleich zwischen Teilnehmenden
•	dem Vergleich zwischen verschiedenen Laufchallenges
Eine Nutzung zu Werbezwecken oder eine Weitergabe an Dritte findet nicht statt.
<br></br>
3. Rechtsgrundlage
Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. a DSGVO auf Basis deiner freiwilligen Einwilligung durch Nutzung dieser WebApp.
<br></br>
4. Datensicherheit
Alle Passwörter werden sicher gehasht gespeichert.
Die Daten werden durch technische und organisatorische Maßnahmen vor unbefugtem Zugriff geschützt.
<br></br>
5. Speicherdauer
Die Daten werden nur so lange gespeichert, wie Lauf-Challenges in der Juggersparte bestehen oder bis die Einwilligung widerrufen wird.
<br></br>
6. Deine Rechte
Du hast jederzeit das Recht auf:
•	Auskunft über deine gespeicherten Daten
•	Berichtigung falscher Daten
•	Löschung deiner Daten
•	Einschränkung der Verarbeitung
•	Widerruf deiner Einwilligung
Ein Widerruf führt zur Löschung deines Accounts und aller zugehörigen Laufdaten.
<br></br>
7. Verantwortlicher
Verantwortlich für die Datenverarbeitung ist der VfL Rethwisch e.V.
Die Kontaktdaten für die Ausübung der Rechte nach Punkt 6 befinden sich in der allgemeinen Datenschutzerklärung unter https://www.vfl-rethwisch.de/datenschutz/

                                <label className="flex gap-2 items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={privacyAccepted}
                                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                        className="mt-1"
                                    />
                                    <span>
                                        Datenschutzerklärung akzeptiert
                                    </span>
                                </label>
                                
                            </div>
                        </>
                    )}

                    <ReCAPTCHA
                        sitekey="6LdD9iUsAAAAAORIQoTEICBafAyUTqkm60xNRO8M"
                        onChange={(value) => setCaptchaValue(value)}
                    />

                    <button
                        type="button"
                        onClick={handleRegister}
                        disabled={state === 'register' && !privacyAccepted}
                        className={`w-full rounded-xl py-2 font-medium transition ${
                            state === 'register' && !privacyAccepted
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-zinc-500 hover:bg-zinc-600 text-white'
                        }`}
                    >
                        Registrieren
                    </button>

                    <button
                        type="button"
                        onClick={logUserIn}
                        className="w-full bg-blue-600 text-white rounded-xl py-2 font-medium hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

type LoginFormInputProps = {
    value: string | number;
    onValueChange: (e: string) => void;
    lable: string;
    type?: string;
    placeholder?: string;
    password: boolean;
};

const LoginFormInput: FC<LoginFormInputProps> = ({ lable, type, value, onValueChange, placeholder, password }) => {
    return (
        <>
            <label className="block mb-1 text-sm font-medium">{lable}</label>
            <input
                type={password ? 'password' : type}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={placeholder || `${lable} ...`}
                required
                className="w-full border rounded-xl px-3 py-2"
            />
        </>
    );
};

type LoginFormSelectProps = {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: { key: string; value: string }[];
    placeholder?: string;
};

const LoginFormSelect: FC<LoginFormSelectProps> = ({ label, value, onValueChange, options, placeholder }) => {
    return (
        <>
            <label className="block mb-1 text-sm font-medium">{label}</label>
            <select
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                required
                className="w-full border rounded-xl px-3 py-2 bg-white"
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.key}
                    </option>
                ))}
            </select>
        </>
    );
};
