import fetch from 'cross-fetch';

type FetcherOptions = {
  username: string
  password: string
  baseUrl: string
}

export default class Fetcher {
  private readonly username;
  private readonly password;
  private readonly baseUrl;

  constructor({
    username,
    password,
    baseUrl
  }: FetcherOptions) {
    this.username = username;
    this.password = password;
    this.baseUrl = baseUrl;
  }

  async request<B extends object = {}>(path: string, body?: B) {
    return fetch(
      `${this.baseUrl}${path}`,
      {
        method: "POST",
        headers: [
          ['Content-Type', 'application/json']
        ],
        body: JSON.stringify(body)
      })
  }

  async requestAuthorized<B extends object = {}>(path: string, body?: B) {
    return fetch(
      `${this.baseUrl}${path}`,
      {
        method: "POST",
        headers: [
          ['Content-Type', 'application/json'],
          ["Authorization", `Basic ${this.username}:${this.password}`]
        ],
        body: JSON.stringify(body)
      })
  }
}
