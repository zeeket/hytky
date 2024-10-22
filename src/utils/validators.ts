import { z } from 'zod';

const titleRegex =
  /^(?!\s)(?=.*[a-zA-ZåäöÅÄÖ])[a-zA-Z0-9åäöÅÄÖ]+(?: [a-zA-Z0-9åäöÅÄÖ]+)*(?<!\s)$/;

const customTitleSchema = z
  .string()
  .min(2, 'Otsikon on oltava vähintään 2 merkkiä pitkä.')
  .max(50, 'Otsikko voi olla enintään 50 merkkiä.')
  .regex(
    titleRegex,
    'Otsikon oltava alfanumeerinen (+åäö) ja voi sisältää välilöyntejä, mutta ensimmäinen tai viimeinen merkki ei saa olla välilyönti.'
  );

/* const isValidTitle = (title: string):boolean => {
  return customTitleSchema.safeParse(title).success;
} */

const postRegex = /^(?!\n|\r)[\t\n\r\x20-\x7E€£åäöÅÄÖ]*(?<!\n|\r)$/;

const customPostSchema = z
  .string()
  .min(2, 'Viestin on oltava vähintään 2 merkkiä pitkä.')
  .max(2000, 'Viesti voi olla enintään 2000 merkkiä.')
  .regex(
    postRegex,
    'Viestin oltava alfanumeerinen (+åäöÅÄÖ) ja voi sisältää välilöyntejä, mutta ensimmäinen tai viimeinen merkki ei saa olla rivinvaihto.'
  );

export { customPostSchema, customTitleSchema };
