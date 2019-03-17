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
        public bool Success { get; set; } = true;

        public APIResponseBase() { Type = GetType().Name; }
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

        public APIResponse(string message = null) { Message = message; }

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

        public DataResponse(T data = default(T)) { Data = data; }
        public DataResponse(string errorMessage) : base(errorMessage) { Success = false; }

        public static implicit operator DataResponse<T>(T d) => new DataResponse<T>(d);
    }

    // ########################################################################################################################

    public static class ResponseExtensions
    {
        public static DataResponse<T> AsResponse<T>(this T v) => new DataResponse<T>(v);
    }

    // ########################################################################################################################
}