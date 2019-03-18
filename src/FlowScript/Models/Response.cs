using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace FlowScript.API
{
    // ########################################################################################################################

    public interface IAPIResponseBase
    {
        string Type { get; }
        bool Success { get; set; }
    }

    /// <summary> A based class for all responses. </summary>
    public abstract class APIResponseBase : IAPIResponseBase
    {
        public string Type { get; set; }
        public bool Success { get; set; }

        public APIResponseBase(bool success = true) { Type = GetType().Name; Success = success; }
    }

    // ########################################################################################################################

    public interface IAPIResponse : IAPIResponseBase
    {
        string Message { get; set; }
    }

    public class APIResponse : APIResponseBase, IAPIResponse
    {
        public static APIResponse OK = new APIResponse();

        /// <summary> A message, usually when there's an error. </summary>
        public string Message { get; set; }

        public APIResponse(string message = null, bool success = true) : base(success) { Message = message; }

        public static implicit operator APIResponse(string s) => new APIResponse(s);
    }

    // ########################################################################################################################

    public interface IDataResponse : IAPIResponse
    {
        object Data { get; set; }
    }

    public class DataResponse<T> : APIResponse, IDataResponse
    {
        public T Data;

        object IDataResponse.Data { get => Data; set => Data = (T)value; }

        public DataResponse(T data = default(T), bool success = true, string message = null) : base(message, success) { Data = data; }
        public DataResponse(string errorMessage) : base(errorMessage, false) { Success = false; }

        public static implicit operator DataResponse<T>(T d) => new DataResponse<T>(d);
    }

    // ########################################################################################################################

    public static class ResponseExtensions
    {
        public static DataResponse<T> AsResponse<T>(this T v) => new DataResponse<T>(v);
        public static DataResponse<object> AsError(this string msg) => new DataResponse<object>(msg);
    }

    // ########################################################################################################################
}