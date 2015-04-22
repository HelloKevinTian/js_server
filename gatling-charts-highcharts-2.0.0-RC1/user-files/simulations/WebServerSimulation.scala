
import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class WebServerSimulation extends Simulation {

	val httpProtocol = http
		.baseURL("http://192.168.22.61:20001")
		.inferHtmlResources()
		.acceptHeader("""image/png,image/*;q=0.8,*/*;q=0.5""")
		.acceptEncodingHeader("""gzip, deflate""")
		.acceptLanguageHeader("""en-us,en;q=0.5""")
		.contentTypeHeader("""application/x-www-form-urlencoded; charset=UTF-8""")
		.userAgentHeader("""Mozilla/5.0 (X11; Linux x86_64; rv:10.0.12) Gecko/20130109 Firefox/10.0.12""")

	val headers_0 = Map("""Accept""" -> """text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8""")

	val headers_3 = Map("""Accept""" -> """text/css,*/*;q=0.1""")

	val headers_5 = Map("""Accept""" -> """*/*""")

	val headers_7 = Map(
		"""Accept""" -> """text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8""",
		"""Content-Type""" -> """application/x-www-form-urlencoded""")

	val headers_14 = Map(
		"""Accept""" -> """application/json, text/javascript, */*; q=0.01""",
		"""Cache-Control""" -> """no-cache""",
		"""Pragma""" -> """no-cache""",
		"""X-Requested-With""" -> """XMLHttpRequest""")

    val uri1 = """http://192.168.22.61:20001"""

	val scn = scenario("WebServerSimulation")
		.exec(http("request_0")
			.get("""/""")
			.headers(headers_0)
			.resources(http("request_1")
			.get(uri1 + """/img/glyphicons-halflings.png""")
			.check(status.is(304))))
		.pause(1)
		.exec(http("request_2")
			.get("""/login""")
			.headers(headers_0)
			.resources(http("request_3")
			.get(uri1 + """/stylesheets/bootstrap.css""")
			.headers(headers_3)
			.check(status.is(304)),
            http("request_4")
			.get(uri1 + """/stylesheets/bootstrap-responsive.css""")
			.headers(headers_3)
			.check(status.is(304)),
            http("request_5")
			.get(uri1 + """/javascripts/jquery.js""")
			.headers(headers_5)
			.check(status.is(304)),
            http("request_6")
			.get(uri1 + """/javascripts/bootstrap.js""")
			.headers(headers_5)
			.check(status.is(304)))
			.check(status.is(304)))
		.pause(4)
		.exec(http("request_7")
			.post("""/login""")
			.headers(headers_7)
			.formParam("""username""", """lee""")
			.formParam("""password""", """123""")
			.resources(http("request_8")
			.get(uri1 + """/miniui/themes/default/images/button/button.png""")
			.check(status.is(304)),
            http("request_9")
			.get(uri1 + """/miniui/themes/default/images/buttonedit/icon2.gif""")
			.check(status.is(304)),
            http("request_10")
			.get(uri1 + """/miniui/themes/default/images/datepicker/date.gif""")
			.check(status.is(304)),
            http("request_11")
			.get(uri1 + """/miniui/themes/default/images/button/hover.png""")))
		.pause(2)
		.exec(http("request_12")
			.get("""/miniui/themes/default/images/buttonedit/hover.png""")
			.resources(http("request_13")
			.get(uri1 + """/miniui/themes/default/images/buttonedit/pressed.png""")
			.check(status.is(304)))
			.check(status.is(304)))
		.pause(3)
		.exec(http("request_14")
			.post("""/config2""")
			.headers(headers_14)
			.formParam("""type""", """show""")
			.formParam("""version""", """1.2.4""")
			.formParam("""channel""", """template""")
			.resources(http("request_15")
			.post(uri1 + """/config2""")
			.headers(headers_14)
			.formParam("""type""", """show""")
			.formParam("""version""", """1.2.4""")
			.formParam("""channel""", """template""")))
		.pause(2)
		.exec(http("request_16")
			.post("""/config2""")
			.headers(headers_14)
			.formParam("""type""", """show""")
			.formParam("""version""", """1.2.4""")
			.formParam("""channel""", """template"""))

	setUp(scn.inject(atOnceUsers(10))).protocols(httpProtocol)
}