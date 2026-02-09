const StaffTab = ({
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  latestInviteLink,
  staffMembers,
  pendingStatusRequests,
  handleCreateInvite,
  handleApproveStaff,
  handleApproveStatusRequest,
  handleRejectStatusRequest,
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Staff</h2>
      <p className="text-gray-600 mb-6">Send an invite link for staff to create their account.</p>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="email"
          placeholder="staff@email.com"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <select
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value)}
          className="bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="MANAGER">Manager</option>
          <option value="CHEF">Chef</option>
          <option value="DELIVERY">Delivery</option>
          <option value="STAFF">Staff</option>
        </select>
        <button
          onClick={handleCreateInvite}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition"
        >
          Create Invite
        </button>
      </div>
      {latestInviteLink && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800 font-semibold mb-1">Invite Link</p>
          <p className="text-sm text-gray-700 break-all">{latestInviteLink}</p>
        </div>
      )}
    </div>

    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Staff Approvals</h3>
      {staffMembers.filter((member) => !member.approval).length === 0 ? (
        <p className="text-gray-600">No pending staff approvals.</p>
      ) : (
        <div className="space-y-3">
          {staffMembers
            .filter((member) => !member.approval)
            .map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">{member.username}</p>
                  <p className="text-sm text-gray-600">{member.email} • {member.staffRole}</p>
                </div>
                <button
                  onClick={() => handleApproveStaff(member._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Approve
                </button>
              </div>
            ))}
        </div>
      )}
    </div>

    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Status Change Requests</h3>
      {pendingStatusRequests.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
      ) : (
        <div className="space-y-3">
          {pendingStatusRequests.map((request) => (
            <div
              key={request._id}
              className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-200 rounded-lg p-4"
            >
              <div className="mb-3 md:mb-0">
                <p className="font-semibold text-gray-900">
                  Order #{request.orderId?._id?.slice(-6) || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {request.requestedBy?.username || "Staff"} • {request.requestedBy?.staffRole || ""}
                </p>
                <p className="text-sm text-gray-700">
                  {request.fromStatus} → {request.toStatus}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproveStatusRequest(request._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRejectStatusRequest(request._id)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">All Staff Members</h3>
      {staffMembers.length === 0 ? (
        <p className="text-gray-600">No staff members added yet.</p>
      ) : (
        <div className="space-y-3">
          {staffMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
            >
              <div>
                <p className="font-semibold text-gray-900">{member.username}</p>
                <p className="text-sm text-gray-600">{member.email} • {member.staffRole}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  member.approval ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {member.approval ? "Approved" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default StaffTab;
