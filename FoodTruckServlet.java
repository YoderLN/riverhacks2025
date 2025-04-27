
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * Servlet implementation class FoodTruckServlet
 */
@WebServlet("/FoodTruckServlet")
public class FoodTruckServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private List<FoodTruck> foodtrucks = new ArrayList<>();
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public FoodTruckServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
		//response.sendRedirect("index.html");
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        
        
        // Fetch data from API and populate foodtrucks list
        getJsonResponse("0");
        getJsonResponse("20");
        getJsonResponse("40");
        getJsonResponse("60");
        getJsonResponse("80");
        
        
        backToJson(out);
    }

    public void getJsonResponse(String start) {
        String builtQuery = "https://serpapi.com/search.json?engine=google_local&start=" + start + "&q=food+truck&location=Downtown+Austin%2C+Texas%2C+United+States&google_domain=google.com&gl=us&hl=en&api_key=5859c81649339aa8a0ff62e78454e2c919824985c8a3604f79f0de4103b42813";
        
        try {
            HttpClient client = HttpClient.newBuilder().build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(builtQuery))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String apiResponse = response.body();

            if (response.statusCode() != 200) {
                throw new RuntimeException("Failed: HTTP request error code: " + response.statusCode());
            }

            JsonParser parser = new JsonParser();
            JsonObject topLevelObject = parser.parse(apiResponse).getAsJsonObject();
            JsonArray jsonArray = topLevelObject.getAsJsonArray("local_results");

            for (JsonElement el : jsonArray) {
                JsonObject obj = el.getAsJsonObject();
                String title = obj.get("title").getAsString();
                String type = obj.get("type").getAsString();
                JsonObject gps = obj.getAsJsonObject("gps_coordinates");
                String latitude = gps.get("latitude").getAsString();
                String longitude = gps.get("longitude").getAsString();
                
                FoodTruck truck = new FoodTruck(latitude, longitude, title, type);
                foodtrucks.add(truck);
            }
        } 		
        catch (InterruptedException exp1)
		{
			System.err.println("Response interrupted: ");
			System.err.println(exp1.toString());   
		}
		//catch (MalformedInputException exp2)
		//{
		//	System.err.println("Malformed response from request: ");
		//	System.err.println(exp2.toString());
		//}
		catch (IOException exp3)
		{
			System.err.println("Input/Output issue detected: ");
			System.err.println(exp3.toString());
		}
        }
    

    public void backToJson(PrintWriter out) {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String prettyJson = gson.toJson(foodtrucks);
        out.write(prettyJson);
    }
	

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
