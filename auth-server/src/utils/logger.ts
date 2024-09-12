export interface ILogger {
  error: (exception: Error) => void
  event: (name: Events, properties: Record<string, string>) => void
}

export enum Events {
  CONFIRMATION_EMAIL_SENT = "confirmation email has been sent to your email address",
}

export class ConsoleLogger implements ILogger {
  private static consoleLogger: ConsoleLogger

  private constructor() {}

  public static getInstance(): ConsoleLogger {
    if (!this.consoleLogger) {
      this.consoleLogger = new ConsoleLogger()
      this.setupLogger()
    }
    return this.consoleLogger
  }

  public error = (exception: Error) => {
    console.info(`Exception occrued: ${exception.message}`)
  }
  public event = (name: Events, properties?: { [key: string]: any }) => {
    console.info(
      `Event triggred:  ${name} with props: ${
        properties ? JSON.stringify(properties) : "None"
      }`
    )
  }
  private static setupLogger = () => {}
}
