
import scala.concurrent.duration._
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._
import json._
import scala.util.Random

	
class JSServerSimulation extends Simulation {
	println("Hello, JSServerSimulation!")
	var seed = 1000;
	val random = new Random(System.currentTimeMillis)
	/*
	println(random.nextInt(seed))
	println(random.nextInt(seed))
	println(random.nextInt(seed))
	println(random.nextInt(seed))

	var capital = Map("US"->"Washington", "France" -> "Paris") 
	capital += ("Japan" -> "Tokyo") 
	println(capital("France"))
	
	val msg3: String = "Hello yet again, world!"
	
	val big = new java.math.BigInteger("12345")
	println(big)
	
	var jetSet = Set("Boeing", "Airbus") 
	jetSet += "Lear" 
	println(jetSet.contains("Cessna"))
	*/
	
	class Msg {
		var m_aryCmd = List[Map[Any,Any]]();

		def addCmd( cmd:Map[Any,Any] ) : List[Map[Any,Any]]={ 
			m_aryCmd = cmd :: m_aryCmd;
			return m_aryCmd
		}

		def getCmds( ) : String = {
			var cmds = Map("cmds"->m_aryCmd);		  	
			return Json.build(cmds).toString
		}
	}

	object Login {	
		def msg( ) : String = {
			var msg = new Msg;
			var cmd = Map[Any,Any]();
			cmd += ("flowid" -> 88888888);
			cmd += ("msg_id"->3);
			msg.addCmd(cmd);
			return msg.getCmds();
		}
	}	
	
	object get_time {	
		def msg( ) : String = {
			var cmd = Map[Any,Any]();
			cmd += ("msg_id"->3);
			cmd += ("flowid" -> 88888888);
			return Json.build(cmd).toString;
		}
	}

	object get_activity {	
		def msg( ) : String = {
			var cmd = Map[Any,Any]();
			cmd += ("msg_id"->5);
			cmd += ("flowid" -> 88888888);
			cmd += ("activity_type" -> 1);
			cmd += ("channel" -> "000023");
			cmd += ("version" -> "1.2.4");
			return Json.build(cmd).toString;
		}
	}

	object get_notice {
    		def msg( ) : String = {
    			var cmd = Map[Any,Any]();
    			cmd += ("msg_id"->6);
    			cmd += ("flowid" -> 88888888);
    			cmd += ("channel" -> "000023");
    			cmd += ("version" -> "1.2.4");
    			return Json.build(cmd).toString;
    		}
    	}

	object upload_race_time {
    		def msg( ) : String = {
    			var cmd = Map[Any,Any]();
    			cmd += ("msg_id"->7);
    			cmd += ("flowid" -> 88888888);
    			cmd += ("channel" -> "000023");
    			cmd += ("version" -> "1.2.4");
    			cmd += ("deviceid" -> random.nextInt(seed));
    			cmd += ("race_time" -> random.nextInt(seed));
    			cmd += ("car" -> 1);
    			cmd += ("car_level" -> 2);
    			cmd += ("driver" -> 3);
    			cmd += ("driver_level" -> 4);
    			cmd += ("phone_number" -> "18510384228");
    			cmd += ("championship_id" -> 1);
    			return Json.build(cmd).toString;
    		}
    	}

	object get_rank {
    		def msg( deviceid : Int ) : String = {
    			var cmd = Map[Any,Any]();
    			cmd += ("msg_id"->8);
    			cmd += ("flowid" -> 88888888);
    			cmd += ("channel" -> "000023");
    			cmd += ("version" -> "1.2.4");
    			cmd += ("deviceid" -> deviceid);
    			cmd += ("championship_id" -> 1);
    			return Json.build(cmd).toString;
    		}
    	}
	val httpProtocol = http
		.baseURL("http://192.168.22.61:20000")
		.inferHtmlResources()
		
		val scn = scenario("Scenario name")
            .exec(
                http("get_time")
                    .post("/")
                    .formParam("token", "1234567788")
                    .formParam("msg",get_time.msg())
                    .check(status.is(200))
				)
			.pause(1)
			.exec(
                http("get_activity")
                    .post("/")
                    .formParam("token", "1234567788")
                    .formParam("msg",get_activity.msg())
                    .check(status.is(200))
				)
			.pause(1)
			.exec(
                http("get_notice")
                    .post("/")
                    .formParam("token", "1234567788")
                    .formParam("msg",get_notice.msg())
                    .check(status.is(200))
				)
			.pause(1)
			.exec(
                http("upload_race_time")
                    .post("/")
                    .formParam("token", "1234567788")
                    .formParam("msg",upload_race_time.msg())
                    .check(status.is(200))
				)
			.pause(1)
			.exec(
                http("get_rank")
                    .post("/")
                    .formParam("token", "1234567788")
                    .formParam("msg",get_rank.msg(random.nextInt(seed)))
                    .check(status.is(200))
				)
			.pause(1)
	setUp(scn.inject(atOnceUsers(200))).protocols(httpProtocol)
}
