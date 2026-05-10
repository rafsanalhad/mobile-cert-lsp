import * as SQLite from 'expo-sqlite';

async function openDatabaseAsync(name) {
  return await SQLite.openDatabaseAsync(name);
}

export default openDatabaseAsync;
