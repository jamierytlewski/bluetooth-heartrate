import { Task } from "@lit/task";
import { property, customElement } from "lit/decorators.js";
import { LitElement, html, css } from "lit";

@customElement("github-user")
export class GitHubUser extends LitElement {
  @property() username: string = "octocat";

  private _getUser = new Task(this, {
    task: async ([username], { signal }) => {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        signal,
      });
      const data = await response.json();
      return data;
    },
    args: () => [this.username],
  });

  render() {
    return this._getUser.render({
      pending: () => html`<p>Loading...</p>`,
      error: (error: unknown) => html`<p>${error}</p>`,
      success: (data: any) => console.log(data),
      complete: (data: any) => {
        console.log(data);
        return html` <div class="card">
          <div class="card-header">${data.name}</div>
          <div class="card-body">
            <img src="${data.avatar_url}" alt="${data.name}" />
            <div class="card-content">
              <p>${data.bio}</p>
              <p>Followers: ${data.followers}</p>
              <p>Following: ${data.following}</p>
              <p>Public Repos: ${data.public_repos}</p>
            </div>
          </div>
        </div>`;
      },
    });
  }

  static styles = css`
    .card {
      border: 2px solid var(--border-color, yellow);
      border-radius: 0.5rem;
    }

    .card-header {
      font-size: 2rem;
      background-color: var(--header-color, red);
      padding: 0.5rem;
      font-weight: bold;
    }

    .card-body {
      display: flex;
      padding: 1rem;
    }

    .card-content {
      margin-left: 1rem;
    }

    img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }
  `;
}
