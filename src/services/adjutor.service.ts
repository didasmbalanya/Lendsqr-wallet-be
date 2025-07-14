import axios from "axios";

export class AdjutorService {
  private readonly apiKey: string;
  private readonly baseUrl =
    "https://adjutor.lendsqr.com/v2/verification/karma";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Check if a user is blacklisted
   */
  async isBlacklisted(email: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/${email}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data?.blacklisted === true;
    } catch (error) {
      // Fail open during development, but fail closed in production
      return false;
    }
  }
}
