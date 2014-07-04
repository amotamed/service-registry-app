package controllers

import models.ServiceRegistry
import play.api.mvc._
import play.api.libs.json.Json
import services.ServiceRegistryDAO


/**
 * Created by amotamed on 6/28/14.
 */
object ServiceRegistryController extends Controller {

  implicit val serviceRegistryWrites = Json.writes[ServiceRegistry]
  implicit val serviceRegistryReads = Json.reads[ServiceRegistry]

  def deleteServiceRegistry(name : String) = Action {
    ServiceRegistryDAO.delete(name)
    Ok("success")
  }

  def getServiceRegistry(filter: Option[String], size: Option[Int], offset: Option[Int]) = Action {
    val serviceRegistries = ServiceRegistryDAO.get(filter, size, offset)
    Ok(Json.toJson(serviceRegistries).toString())
  }


  def postServiceRegistry = Action(parse.json) { request =>
    val serviceRegistry: ServiceRegistry = Json.fromJson(request.body).get
    ServiceRegistryDAO.upsert(serviceRegistry)
    Ok("success")
  }

}

