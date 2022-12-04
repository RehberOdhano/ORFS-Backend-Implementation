const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const csv = require("fast-csv");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");
const supertest = require("supertest");
const { OAuth2Client } = require("google-auth-library");
const PDFDocument = require("pdfkit-table");
const busboy = require("busboy");
const amqp = require("amqplib");
const RedisQueue = require("bull");
const socket = require("socket.io");
const http = require("http");
const redis = require("redis");
const Stripe = require("stripe");
const axios = require("axios");

module.exports = {
  express,
  cors,
  passport,
  jwt,
  bcrypt,
  crypto,
  mongoose,
  csv,
  path,
  fs,
  multer,
  nodemailer,
  supertest,
  OAuth2Client,
  PDFDocument,
  busboy,
  amqp,
  dotenv,
  RedisQueue,
  http,
  socket,
  redis,
  Stripe,
  axios,
};
