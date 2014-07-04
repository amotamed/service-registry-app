/**
 * Created by amotamed on 6/26/14.
 */
import play.api._

object Global extends GlobalSettings {

  override def onStart(app: Application) {
    Logger.info("Application has started, for realz")
  }
}
