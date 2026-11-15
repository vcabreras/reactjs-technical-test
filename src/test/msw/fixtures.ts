/** Datos con la misma forma que JSONPlaceholder (respuesta cruda, antes de pasar por Zod). */

export interface RawUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: { street: string; suite: string; city: string; zipcode: string };
  company: { name: string; catchPhrase: string; bs: string };
}

export interface RawPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

function makeUser(
  id: number,
  name: string,
  username: string,
  email: string,
  city: string,
): RawUser {
  return {
    id,
    name,
    username,
    email,
    phone: `555-000-${String(id).padStart(4, '0')}`,
    website: `${username.toLowerCase()}.example`,
    address: { street: 'Main St', suite: `Apt. ${id}`, city, zipcode: '00000' },
    company: { name: `${username} Inc`, catchPhrase: 'Lorem', bs: 'ipsum' },
  };
}

export const users: RawUser[] = [
  makeUser(1, 'Leanne Graham', 'Bret', 'Sincere@april.biz', 'Gwenborough'),
  makeUser(2, 'Ervin Howell', 'Antonette', 'Shanna@melissa.tv', 'Wisokyburgh'),
  makeUser(3, 'Clementine Bauch', 'Samantha', 'Nathan@yesenia.net', 'McKenziehaven'),
  makeUser(4, 'Patricia Lebsack', 'Karianne', 'Julianne.OConner@kory.org', 'South Elvis'),
  makeUser(5, 'Chelsey Dietrich', 'Kamren', 'Lucio_Hettinger@annie.ca', 'Roscoeview'),
  makeUser(
    6,
    'Mrs. Dennis Schulist',
    'Leopoldo_Corkery',
    'Karley_Dach@jasper.info',
    'South Christy',
  ),
  makeUser(7, 'Kurtis Weissnat', 'Elwyn.Skiles', 'Telly.Hoeger@billy.biz', 'Howemouth'),
];

export const posts: RawPost[] = [
  { id: 1, userId: 1, title: 'Primer post de Leanne', body: 'Cuerpo 1' },
  { id: 2, userId: 1, title: 'Segundo post de Leanne', body: 'Cuerpo 2' },
  { id: 3, userId: 2, title: 'Post de Ervin', body: 'Cuerpo 3' },
];
