import jwt from 'jsonwebtoken';
import environment from '../environment';

const expiresIn: string = '1d';

function generateAccessToken(member: Pick<Member, 'entity_id' | 'affiliate_id' | 'member_id'>): string {
    const payload: Session = {
        expiresIn,
        ...member
    };

    return jwt.sign(payload, environment.SECRET_KEY, { expiresIn });
};

const generateRandomNumber = (max: number, min: number = 0): number => Math.floor(Math.random() * (max + 1) + min);

function generateSalt(length: number): string {
    const salt: string[] = [];

    if (length !== 0) {
        const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!?@#$%&^*()[]{}_-+<>";
        for (let index = 0; index < length; index++) {
            salt.push(CHARS[generateRandomNumber(CHARS.length - 1)]);
        }
    }
    return salt.join('');
};

const Helper = { generateAccessToken, generateSalt };

export default Helper;
