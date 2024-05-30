import { Octokit } from "@octokit/rest";
import fs from 'fs';

export const createRepo = (done) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  octokit.repos.createForAuthenticatedUser({
    name: `${app.path.rootFolder}_dev`,
    description: 'This is my new repository',
    private: true
  }).then(({ data }) => {
    console.log(app.plugins.chalk.green("Репозиторий успешно создан:"), data.html_url);
    fs.writeFileSync('.env', `\nREPO_URL=${data.clone_url}\n`, { flag: 'a' });
    done()
  }).catch((error) => {
    console.error("Ошибка при создании репозитория: ", error);
  });
};
