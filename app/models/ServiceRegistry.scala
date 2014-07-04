package models

/**
 * Created by amotamed on 6/23/14.
 */
case class ServiceRegistry(name: String,
                       endpoints: List[String],
                       port: Int,
                       attributes: Map[String,String]) { }
