var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cron = require("node-cron");

require("dotenv").config();
const swaggerUi = require("swagger-ui-express");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter= require("./routes/admin")
var carsRouter = require("./routes/cars");
var notificationRouter = require("./routes/notification");
var TechPaymentRouter = require("./routes/TechPay");
const getAlllocationsRouter = require("./routes/getAlllocations");
const {checkTelcellPayments} = require("./controllers/TechPayController");

const {
  sendInspectionMessage,
  sendPaymentMessage,
} = require("./controllers/lib");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(fileUpload());

app.use("/", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/cars", carsRouter);
app.use("/api/v1/techPayment", TechPaymentRouter);
app.use("/api/v1/", getAlllocationsRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(require("./controllers/swaggerController").swaggerSpec)
);
app.use(express.static(path.resolve(__dirname, "static")));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const cronSchedule = "0 0 0 */10 * *";
const cronThirtyMinutes = "*/10 * * * *";
const cronMinutes = "* * * * *";

cron.schedule(cronSchedule, () => {
  sendInspectionMessage();
});
cron.schedule(cronMinutes, () => {
  checkTelcellPayments()
});

cron.schedule(cronThirtyMinutes, () => {
  sendPaymentMessage();
});
module.exports = app;
