import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import com.google.gson.*;

public class SimpleHttPServer{
	public static List<FoodTruck> foodtrucks = new ArrayList<>();
	
	public  static class FoodTruck {

		String latitude;
		String longitude;
		String title;
		String type;
		
		public FoodTruck(String latitude, String longitude, String title, String type)
		{
			this.latitude = latitude;
			this.longitude = longitude;
			this.title = title;
			this.type = type;
		}
		
		@Override
		public String toString() {
			return String.format("%s %s%n%s %s%n%s %s%n%s %s", "latitude: ", latitude, 
					"longitude: ", longitude, 
					"Name: ", title, 
					"Type: ", type);
		}
	}
		
		public static void getJsonResponse(String start)
		{
			String builtQuery = "https://serpapi.com/search.json?engine=google_local&start="+start+ "&q=food+truck&location=Downtown+Austin%2C+Texas%2C+United+States&google_domain=google.com&gl=us&hl=en&api_key=5859c81649339aa8a0ff62e78454e2c919824985c8a3604f79f0de4103b42813";
			
			try 
			{
	            HttpClient client = HttpClient.newBuilder().build();
	            HttpRequest request = HttpRequest.newBuilder()
	            		.uri(URI.create(builtQuery))
	                   .GET()
	                   .build();
	            HttpResponse<String> response;
	            response = client.send(request, HttpResponse.BodyHandlers.ofString());
	            String apiResponse = response.body();
	            if (response.statusCode() != 200)
	            {	
					throw new RuntimeException("Failed: HTTP request error code: " +
							response.statusCode());
	            }            
	           
	            JsonParser parser = new JsonParser();
	            JsonObject topLevelObject = parser.parse(apiResponse).getAsJsonObject();
	            JsonArray jsonArray = topLevelObject.getAsJsonArray("local_results"); // <<<< correct key here

	            for (JsonElement el : jsonArray) {
	                JsonObject obj = el.getAsJsonObject();

	                String title = obj.get("title").getAsString();
	               //System.out.println(title);
	                
	                String type = obj.get("type").getAsString();
	                //System.out.println(type);
	                
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
			catch (MalformedInputException exp2)
			{
				System.err.println("Malformed response from request: ");
				System.err.println(exp2.toString());
			}
			catch (IOException exp3)
			{
				System.err.println("Input/Output issue detected: ");
				System.err.println(exp3.toString());
			}
	}
		
		public static void displayFoodTrucks()
		{
			
			 for (FoodTruck truck : foodtrucks) {
	             System.out.println(truck);
	         }
		}
	
		
		public static void backToJson()
		{
			
			Gson gson = new GsonBuilder().setPrettyPrinting().create();
			String prettyJson = gson.toJson(foodtrucks);
			
			
			try (FileWriter writer = new FileWriter("data.json")) {
	            writer.write(prettyJson);
	            System.out.println("Successfully wrote JSON to file: data.json");
	        } catch (IOException e) {
	            System.err.println("Error writing to file: " + e.getMessage());
	        }
		}
	
	
    public static void main(String[] args) throws IOException {
        int port = 8700; // server will listen on localhost:8000

        
        
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("Server started on port " + port);
            	
            while (true) {
                Socket clientSocket = serverSocket.accept();
                new Thread(new ClientHandler(clientSocket)).start();
            }
            
            
        }
    }

    static class ClientHandler implements Runnable {
        private final Socket clientSocket;

        ClientHandler(Socket socket) {
            this.clientSocket = socket;
        }

        @Override
        public void run() {
        	
        	getJsonResponse("0");
        	getJsonResponse("20");
            getJsonResponse("40");
            getJsonResponse("60");
            getJsonResponse("100");
            //getJsonResponse("80");
            
            backToJson();
            try (
            		
            		
                BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                BufferedWriter out = new BufferedWriter(new OutputStreamWriter(clientSocket.getOutputStream()))
            ) {
                // Read the request line
                String line = in.readLine();
                if (line == null || line.isEmpty()) {
                    return;
                }
                System.out.println("Request: " + line);
                

                if (line.startsWith("GET")) {
                    

                    //load response
                    String body = loadFileContent("data.json");

                    //Send HTTP Response
                    out.write("HTTP/1.1 200 OK\r\n");
                    out.write("Content-Type: text/plain; charset=UTF-8\r\n");
                    out.write("Content-Length: " + body.getBytes(StandardCharsets.UTF_8).length + "\r\n");
                    out.write("\r\n");
                    out.write(body);
                    out.flush();
                }

                clientSocket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        private String loadFileContent(String filename) {
            File file = new File("data.json");
            if (!file.exists()) {
                return "File not found!";
            }
            try {
                return new String(java.nio.file.Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
            } catch (IOException e) {
                return "Error reading file: " + e.getMessage();
            }
        }
    }
    
}

