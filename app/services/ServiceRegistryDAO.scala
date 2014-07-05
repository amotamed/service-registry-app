package services

import models.ServiceRegistry
import play.api.Play
import play.mvc._
import com.mongodb.casbah.Imports._
import scala.collection.JavaConverters._

import com.novus.salat._
import com.novus.salat.global._


/**
 * Created by amotamed on 6/26/14.
 */
object ServiceRegistryDAO {

  val mongoConn = MongoConnection()
  val mongoDB = mongoConn("service_registry_app")("service_registry")

  implicit val ctx = new Context {
    val name = "Custom_Classloader"
  }
  ctx.registerClassLoader(Play.classloader(Play.current))

  def upsert(serviceRegistry : ServiceRegistry) = {
    val dbo = grater[ServiceRegistry].asDBObject(serviceRegistry)
    mongoDB.update(DBObject("name" -> serviceRegistry.name), dbo, upsert = true)
  }

  def get(filter: Option[String], size: Option[Int], offset: Option[Int]) : List[ServiceRegistry] = {

    val results = filter match {
      case Some(result:String) => {

        val builder = MongoDBObject.newBuilder
        result.split("&").map{ kv =>
          val pair = kv.split("=")
          pair(0) match {
            case "port" =>  builder += pair(0) -> pair(1).toInt
            case _ =>  builder += pair(0) -> pair(1)
          }
        }
        mongoDB.find(builder.result())
      }
      case _ =>  mongoDB.find()
    }

    size.map( limit => results.limit(limit))
    offset.map( skip => results.skip(skip))

    results.map{ result =>
      grater[ServiceRegistry].asObject(result)
    }.toList

  }

  def delete(name: String) = {
    mongoDB.remove(DBObject("name" -> name))
  }


}
